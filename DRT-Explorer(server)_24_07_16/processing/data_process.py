import os
import json
import pprint

pp = pprint.PrettyPrinter(indent=4, depth=10)

dirname = os.path.dirname
SITE_ROOT = os.path.realpath(dirname(dirname(__file__)))
DATA_ROOT = os.path.join(SITE_ROOT, 'data')

log_file_name = 'logs_20_47_25.json'
log_path = os.path.join(DATA_ROOT, log_file_name)

log_list = []


def preprocess():
    global log_list
    with open(log_path, "r") as read_file:
        log_list = json.load(read_file)
    print('Load Log Data Done.')
