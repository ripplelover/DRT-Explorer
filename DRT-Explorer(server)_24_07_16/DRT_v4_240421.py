import json
import random
import numpy as np
import time
import pprint
pp = pprint.PrettyPrinter(indent=4, depth=10)

computation_time_list = []
acceptance_requests_list = []
driving_time_list = []

waiting_time_list = []
in_vehicle_time_list = []
detour_time_list = []
occupancy_list = []


class Vehicle:
    MAX_PAX = 6

    def __init__(self, uid):
        self.id = uid

        self.start_time = -1

        self.curr_pos = None
        self.curr_time = None
        self.curr_pax = 0

        self.curr_request_id = None
        self.request_queue = []

        # Statistics
        self.num_resolved_request = 0
        self.total_travel_time = 0
        self.occupancy_dict = {}
        self.pick_dict = {}
        self.drop_dict = {}

    def __str__(self):
        return '[DRT] ID: {} / Curr Pos: {} / Curr Time: {} / Curr Pax: {}'.format(self.id, self.curr_pos, self.curr_time, self.curr_pax)


def t_to_hm(curr_t):
    ch = int(curr_t / 60)
    cm = curr_t - ch * 60
    return [ch, cm]


class DRTScheduler:

    def __init__(self):
        self.node_list = []
        self.min_node_id = 10000000000
        self.max_node_id = -10000000000

        self.od_dict = {}
        self.record_list = []
        self.record_dict = {}
        self.num_resolved_request = 0

        self.record_time_dict = {}
        self.min_rt = None
        self.max_rt = None

        self.drt_list = []
        self.drt_dict = {}

        self.p_task_dict = {}  # Key: Request ID, Value: Pickup Task
        self.d_task_dict = {}  # Key: Request ID, Value: Pickup Task

    def read_nodes(self, file_path):
        self.node_list = []
        self.min_node_id = 10000000000
        self.max_node_id = -10000000000
        with open(file_path, "r", encoding='UTF-8') as read_file:
            self.node_list = json.load(read_file)

        print('==================== NODE ====================')
        print('Number of Nodes : {}'.format(len(self.node_list)))
        print('Sample Node Structure:')
        pp.pprint(self.node_list[0])

        for n in self.node_list:
            n_id = n['id']
            if n_id < self.min_node_id:
                self.min_node_id = n_id
            if n_id > self.max_node_id:
                self.max_node_id = n_id
        print('Node ID : min={} & max={}'.format(self.min_node_id, self.max_node_id))
        print('==============================================')
        print()

    def read_od_cost(self, file_path):
        with open(file_path, "r", encoding='UTF-8') as read_file:
            self.od_dict = json.load(read_file)
        new_dict = {}
        for k, v in self.od_dict.items():
            curr_dict = {}
            new_dict[int(k)] = curr_dict
            for k2, v2, in v.items():
                curr_dict[int(k2)] = v2
        self.od_dict = new_dict
        print('==================== OD ====================')
        print(len(self.od_dict))
        print(self.od_dict.keys())
        print('============================================')
        print()

    def read_requests(self, file_path):
        with open(file_path, "r", encoding='UTF-8') as read_file:
            self.record_list = json.load(read_file)

        print('==================== RECORD ====================')
        # print(len(self.record_list))

        # Record Filtering
        # r_filtered_list = []
        # for r in self.record_list:
        #     if (r['d1_hour'] == 7) or (r['d1_hour'] == 8):
        #     # if r['d1_hour'] == 7 and r['d1_min'] < 10:
        #         r_filtered_list.append(r)
        # self.record_list = r_filtered_list

        self.record_dict = {}
        for r in self.record_list:
            self.record_dict[r['id']] = r
        print('Number of Records : {}'.format(len(self.record_dict)))
        print('Sample Record Structure:')
        pp.pprint(self.record_list[0])
        print('===============================================')
        print()

    def derive_num_drts(self):
        h_count = [0] * 24
        for r in self.record_list:
            h_id = r['d1_hour']
            h_count[h_id] += 1
        max_req = max(h_count)
        return int(max_req / 10)

    def generate_random_requests(self, num_request, curr_hour=11):
        self.record_list = []
        self.record_dict = {}

        for i in range(1, num_request + 1):
            r_id = i

            od = random.sample(range(self.min_node_id, self.max_node_id + 1), 2)
            from_node_id = od[0]
            to_node_id = od[1]
            if from_node_id == to_node_id:
                print("Error : same origin and destination...")
                break

            travel_time = self.od_dict[from_node_id][to_node_id]

            curr_pop = np.random.geometric(p=0.75)

            curr_min = random.sample(range(1, 60), 1)[0]  # from 1 to 59
            e_dep_t = curr_hour * 60 + curr_min
            l_dep_t = e_dep_t + 10
            e_arr_t = e_dep_t + travel_time
            l_arr_t = e_arr_t + 10

            l_dep_hm = t_to_hm(l_dep_t)
            e_arr_hm = t_to_hm(e_arr_t)
            l_arr_hm = t_to_hm(l_arr_t)

            item = {
                'id': r_id,
                'request_hour': curr_hour,
                'request_min': curr_min,
                'from_node_id': from_node_id,
                'to_node_id': to_node_id,
                'population': curr_pop,
                'd1_hour': curr_hour,
                'd1_min': curr_min,
                'd2_hour': l_dep_hm[0],
                'd2_min': l_dep_hm[1],
                'a1_hour': e_arr_hm[0],
                'a1_min': e_arr_hm[1],
                'a2_hour': l_arr_hm[0],
                'a2_min': l_arr_hm[1],
            }
            self.record_list.append(item)

        for r in self.record_list:
            self.record_dict[r['id']] = r

    def preprocess_requests(self):
        self.record_time_dict = {}
        self.min_rt = 10000000000000000
        self.max_rt = -1
        for r in self.record_list:
            # pp.pprint(r)
            curr_t = r['request_hour'] * 60 + r['request_min']
            # print(curr_t)
            if self.min_rt > curr_t:
                self.min_rt = curr_t
            if self.max_rt < curr_t:
                self.max_rt = curr_t
            if curr_t not in self.record_time_dict:
                self.record_time_dict[curr_t] = []
            self.record_time_dict[curr_t].append(r)
        # print('Time Range : [{}, {}]'.format(min_rt, max_rt))
        # print('Num. Time having requests: {}'.format(len(record_time_dict)))

    def generate_drt(self, num_drt=4):
        self.drt_list = []
        self.drt_dict = {}

        node_range = list(range(self.min_node_id, self.max_node_id + 1))
        drt_init_pos = [random.choice(node_range) for i in range(num_drt)]
        # drt_init_pos = [1 for i in range(num_drt)]

        for i in range(num_drt):
            drt = Vehicle(i)
            drt.curr_pos = drt_init_pos[i]
            drt.curr_time = self.min_rt
            self.drt_list.append(drt)
            self.drt_dict[i] = drt

    def get_total_travel_time_for_rq(self, request_queue, drt):
        total_travel_time = 0
        curr_pax = drt.curr_pax     # For Checking the number of passengers
        curr_time = drt.curr_time   # For Checking Departure and Arrival Time
        start_node_id = drt.curr_pos
        target_node_id = -1
        for r_id in request_queue:
            is_pickup = False
            curr_req = None
            if r_id > 0:
                # Pick-up
                is_pickup = True
                curr_req = self.record_dict[r_id]
                curr_pax += curr_req['population']
                if curr_pax > Vehicle.MAX_PAX:
                    return -1

                target_node_id = curr_req['from_node_id']
            else:
                # Drop-off
                curr_req = self.record_dict[-r_id]
                curr_pax -= curr_req['population']
                if curr_pax < 0:
                    print('Error: pax become negative...')
                    exit(0)
                target_node_id = curr_req['to_node_id']

            if target_node_id == -1:
                print('Error: target_node_id not set properly...')
                exit(0)

            curr_travel_time = self.od_dict[start_node_id][target_node_id]
            curr_time += curr_travel_time
            total_travel_time += curr_travel_time

            if is_pickup is True:
                if curr_time > curr_req['d2_hour'] * 60 + curr_req['d2_min']:
                    return -1
            else:
                if curr_time > curr_req['a2_hour'] * 60 + curr_req['a2_min']:
                    return -1

            start_node_id = target_node_id

        # Check whether final pax is non-zero
        if curr_pax != 0:
            print("Error: final pax is non zero...")
            exit(0)

        return total_travel_time

    def generate_min_candidate_rq(self, request_queue, drt, request):
        r_id = request['id']
        queue_length = len(request_queue)

        pick_id = r_id
        drop_id = -r_id
        min_tt = 10000000000000000000
        min_rq = None
        for i in range(queue_length + 1):
            for j in range(i + 1, queue_length + 2):
                request_queue.insert(i, pick_id)
                request_queue.insert(j, drop_id)

                rq_tt = self.get_total_travel_time_for_rq(request_queue, drt)

                print("Request Queue: ", request_queue)
                print("Total Travel Time: ", rq_tt)

                if rq_tt >= 0:

                    min_tt = min(min_tt, rq_tt)
                    min_rq = request_queue[:]

                request_queue.pop(j)
                request_queue.pop(i)

        return min_rq, min_tt

    def run_insertion_heuristic(self, verbose=False):
        print("=========================== Run Insertion Heuristic ===============================")
        print('Num DRT : {} / Num Request : {}'.format(len(self.drt_list), len(self.record_list)))
        print('Start Time : {}'.format(self.min_rt))

        # Time Loop
        curr_rt = self.min_rt
        end_rt = self.max_rt
        buffer_record_list = []
        passed_id_set = set()
        while True:
            if verbose is True:
                print('==================================================')

            """ (1) Update Schedules
            : If there is a request within this time step
            """
            if (curr_rt in self.record_time_dict) or (len(buffer_record_list) > 0):

                curr_record_list = []   # 현재 처리 후보가 들어가는 record의 리스트
                if curr_rt in self.record_time_dict:
                    curr_record_list.extend(self.record_time_dict[curr_rt])
                if len(buffer_record_list) > 0:
                    curr_record_list.extend(buffer_record_list)
                if verbose is True:
                    print("Time : {}, Num. Requests : {} (Passed : {})".format(curr_rt, len(curr_record_list), len(buffer_record_list)))

                # Flush buffer list
                buffer_record_list = []

                # print('============= Allocation =================')
                while len(curr_record_list) > 0:
                    if verbose is True:
                        print('Num. Remaining Records : {}'.format(len(curr_record_list)))

                    # Record X DRT combinations
                    # all_candidate_tqs = []

                    # aa = len(curr_record_list)
                    # bb = len(self.drt_list)
                    # print('{} / Record X DRT = {} X {} = {}'.format(curr_rt, aa, bb, aa*bb))
                    s_time = time.time()

                    min_cost = 1000000000000
                    min_rq = None
                    min_drt = None
                    resolved_r_id = None
                    for r in curr_record_list:
                        for drt in self.drt_list:
                            new_rq, curr_cost = self.generate_min_candidate_rq(drt.request_queue, drt, r)
                            if new_rq is not None:
                                if min_cost > curr_cost:
                                    min_cost = curr_cost
                                    min_rq = new_rq
                                    min_drt = drt
                                    resolved_r_id = r['id']

                    e_time = time.time()
                    # print('Combinations', e_time - s_time)

                    # If there is no valid request for dealing
                    if min_rq is None:
                        # print('No Valid RQ')
                        # if verbose is True:
                        #     print("No Valid Candidate This Time !!!! / Passing Records : {}".format(len(buffer_record_list)))
                        break

                    # if verbose is True:
                    # print("Min cost rq :", min_rq, '/', min_cost, '/', min_drt.id)

                    if verbose is True:
                        print("Chosen DRT:", min_drt)

                    # Update task queue for chosen DRT
                    min_drt.request_queue = min_rq

                    # Update Statistics
                    min_drt.num_resolved_request += 1

                    if min_drt.start_time == -1:
                        min_drt.start_time = curr_rt

                    # Remove the resolved request from the list
                    remain_record_list = []
                    for r in curr_record_list:
                        if r['id'] != resolved_r_id:
                            remain_record_list.append(r)
                    curr_record_list = remain_record_list

            """ (2) Update DRT Info.
            : Update finished tasks and current position, time for DRTs
            """
            # print('============= Update =================')

            for drt in self.drt_list:
                rq = drt.request_queue

                # 동시간에 처리할 수 있는 여러 task를 전부 처리하기 위해 while 문을 활용
                while drt.curr_time == curr_rt:
                    if len(rq) > 0:
                        # (1) 남은 스케쥴의 가장 앞 request를 배정, Request Queue 에서 이 request는 제거
                        coming_r_id = rq.pop(0)

                        # (2) 그 Request에 따라 위치, 시간, 승객 정보를 수정
                        drt.curr_request_id = coming_r_id

                        target_node_id = None
                        delta_pax = None
                        if coming_r_id > 0:
                            curr_req = self.record_dict[coming_r_id]
                            target_node_id = curr_req['from_node_id']
                            delta_pax = curr_req['population']
                        else:
                            curr_req = self.record_dict[-coming_r_id]
                            target_node_id = curr_req['to_node_id']
                            delta_pax = -curr_req['population']

                        curr_tt = self.od_dict[drt.curr_pos][target_node_id]

                        drt.curr_time += curr_tt
                        drt.curr_pax += delta_pax
                        drt.curr_pos = target_node_id

                        # print('drt {} position: {} / curr time : {}'.format(drt.id, drt.curr_pos, curr_rt))

                        drt.occupancy_dict[drt.curr_time] = drt.curr_pax
                        drt.total_travel_time += curr_tt

                    else:  # 더는 현 시점에서 끝내버릴 수 있는 남은 task가 없으면
                        drt.curr_request_id = None
                        # 시간 정보만 최신으로 업데이트
                        drt.curr_time += 1

                if verbose is True:
                    print(drt)
                    print(drt.request_queue)

            """ (3) Loop Termination Check
            """
            end_flag = True
            if curr_rt < end_rt:
                end_flag = False

            for drt in self.drt_list:
                if drt.curr_request_id is not None:
                    end_flag = False

            if end_flag is True:
                break

            curr_rt += 1
            print(curr_rt)

        self.num_resolved_request = 0
        for drt in self.drt_list:
            self.num_resolved_request += drt.num_resolved_request
        print('Num Resolved Request: {}'.format(self.num_resolved_request))

    def show_statistics(self, verbose=False):
        # print("=========================== Show Statistics ===============================")

        for drt in self.drt_list:
            if verbose is True:
                print(drt)
                print('Num. Resolved Requests: {}, Total Travel Time: {}'.format(drt.num_resolved_request, drt.total_travel_time))
                print()
        print('Total Resolved Requests: {}'.format(self.num_resolved_request))
        print()


def median(nums):
    nums = sorted(nums)
    middle1 = (len(nums) - 1) // 2
    middle2 = len(nums) // 2
    return (nums[middle1] + nums[middle2]) / 2


def print_stats(target_list):
    print("Length: {}, Min: {}, Max: {}, Median: {}, Sum: {}, Mean: {}".format(len(target_list), min(target_list), max(target_list), median(target_list), sum(target_list), sum(target_list) / len(target_list)))
    # print(len(target_list), min(target_list), max(target_list), median(target_list), sum(target_list) / len(target_list))


if __name__ == "__main__":

    sc_inst = DRTScheduler()
    sc_inst.read_nodes("data/node_list.json")
    sc_inst.read_od_cost("data/od_travel_time_dict.json")
    sc_inst.read_requests("data/record_list.json")
    # sc_inst.read_nodes("data/node_list_gangnam.json")
    # sc_inst.read_od_cost("data/od_travel_time_dict_gangnam.json")
    # sc_inst.read_requests("data/record_list_gangnam.json")
    # num_drt = sc_inst.derive_num_drts()
    num_drt = 4

    sc_inst.preprocess_requests()
    sc_inst.generate_drt(num_drt=num_drt)

    start_time = time.time()
    sc_inst.run_insertion_heuristic()
    end_time = time.time()
    computation_time = end_time - start_time

    print('Num DRT: {}'.format(num_drt))
    print('Num Request: {}'.format(len(sc_inst.record_list)))
    print('Computation Time : {}s'.format(computation_time))

    # computation_time_list.append(computation_time)
    # sc_inst.show_statistics(True)

    # print("==============================================")
    # print_stats(computation_time_list)
    # print_stats(acceptance_requests_list)
    # print_stats(driving_time_list)
    # print_stats(waiting_time_list)
    # print_stats(in_vehicle_time_list)
    # print_stats(detour_time_list)
    # print_stats(occupancy_list)
