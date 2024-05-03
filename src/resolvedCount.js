// logs_20_47_25.json으로부터 resolvedCount를 구하는 함수
import recorddata from './logs_20_47_25.json';

function getResolvedCount(recorddata, currentTime) {
    let resolvedCount = 0;
    let requestCount = 0;
    // DRT의 req의 개수는 총 80개이고 데이터에서 DRT에서 몇 종류의 req를 받았는지 확인
    let DrtReqCount = new Array(80).fill(0);

    let filteredData = recorddata.filter(d => d.time === currentTime);
        filteredData.forEach((d, i) => {
        let candidates = d.candidates;
        let chosenID = d.chosen_queue;

        candidates.forEach((candidate, index) => {
            let currID = candidate.id;
            // let rqLength = candidate.rq.length;

            if (chosenID === currID) {
                resolvedCount += 1;
            }
            for (let i = 0; i < filteredData.length; i++) {
                DrtReqCount[candidate.req] = 1;
            }
        });
    });
    //DrtReqCount의 요소들을 모두 더해 requestCount를 구함
    for (let i = 0; i < DrtReqCount.length; i++) {
        requestCount += DrtReqCount[i];
    }
    return { resolvedCount, requestCount };
}

console.log(getResolvedCount(recorddata));

export default getResolvedCount;