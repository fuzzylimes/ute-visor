let summary = {};
let total = { tx: [], rx: [], success: [], codes: {} };
let responseCodes = [];

var socket = io('http://localhost:5555');
socket.on('data update', function (data) {
    summary = {};
    // console.log(data);
    data.forEach(function (o, index) {
        total.tx[index] = 0;
        total.rx[index] = 0;
        total.success[index] = 0;
        var server = Object.keys(o)[0];
        setStatus(server, o);
        // Handle unkown state
        if (o[server].state == 'unk'){
            return true;
        }
            
        let urls = Object.keys(o[server].urls);
        let responses = getCodes(o[server]);
        responses = [...new Set(responses)].sort();
        responseCodes = [...new Set(responseCodes.concat([...responses]))].sort();
        let myHtml = "";
        urls.forEach(url => {
            let p =  o[server].urls[url];
            let methods = Object.keys(p);
            methods.forEach(m => {
                let success = ((p[m].rx / p[m].expected) * 100);
                total.tx[index] += p[m].tx;
                total.rx[index] += p[m].rx;
                total.success[index] += p[m].expected;
                addToSummary(url, p[m]);
                let c;
                success < 100 ? c = 'class="table-warning"' : c = 'class="table-success"';
                myHtml += `<tr ${c}><td>${url}</td><td>${m}</td><td>${p[m].tx}</td><td>${p[m].rx}</td>`
                responses.forEach(r =>{
                    p[m].responses.hasOwnProperty(r) ? 
                    myHtml += `<td>${p[m].responses[r]}</td>` :
                    myHtml += `<td>0</td>`;
                });
                success < 100 ? success = success.toFixed(4) : true; 
                myHtml += `<td>${p[m].times.min.toFixed(4)}</td><td>${p[m].times.max.toFixed(4)}</td><td>${(p[m].times.sum/p[m].tx).toFixed(4)}</td>
                <td>${success}%</td></tr>`
            });
        });
        myHtml += `</table>`
        let headers = ['url', 'Method', 'tx', 'rx'].concat(responses, ['Min', 'Max', 'Avg', 'Success']);
        let head = `<table id="${server}-table" class="table"><tr>`;
        headers.forEach(h => {
            head += `<th>${h}</th>`
        });
        head += `</tr>` + myHtml;
        let card = document.getElementById(server + '-stat-list');
        card.innerHTML = head;

    });
    buildTopSummary();
});

function addToSummary(url, data){
    if(!summary.hasOwnProperty(url)){
        summary[url] = {tx:0, rx:0, success:0, codes: {}};
    }
    summary[url].tx += data.tx;
    summary[url].rx += data.rx;
    summary[url].success += data.expected;
    responseCodes.forEach(r => {
        if (!summary[url].codes.hasOwnProperty(r)) {
            summary[url].codes[r] = 0;
        }
        if (data.responses.hasOwnProperty(r)){
            summary[url].codes[r] += data.responses[r];
        } 
    });
}

function buildTopSummary(){
    let myHtml = "";
    let headers = ['url', 'tx', 'rx'].concat(responseCodes, ['success %']);
    let head = `<table id="summary-table" class="table"><tr>`;
    headers.forEach(h => {
        head += `<th>${h}</th>`
    });
    head += `</tr>`;
    Object.keys(summary).sort().forEach(s => {
        let success = setSuccess(summary[s].rx, summary[s].success);
        myHtml += `<tr><td>${s}</td><td>${summary[s].tx}</td><td>${summary[s].rx}</td>`;
        responseCodes.forEach(r => {
            myHtml += `<td>${summary[s].codes[r]}</td>`;
        });
        myHtml += `<td>${success}%</td></tr>`;
    });
    myHtml += `</table>`;
    document.getElementById('totals-list').innerHTML = head + myHtml;

    document.getElementById('tx-total').textContent = total.tx.reduce((a, b) => a + b, 0);
    document.getElementById('rx-total').textContent = total.rx.reduce((a, b) => a + b, 0);
    let success = setSuccess(total.rx.reduce((a, b) => a + b, 0), total.success.reduce((a, b) => a + b, 0));
    document.getElementById('success-total').textContent = `${success}%`;
}

function setSuccess(rx, success){
    success = (success/rx) * 100;
    success < 100 ? success = success.toFixed(4) : true;
    return success;
}

function setStatus(server, o){
    var state = o[server].state;
    var span = document.getElementById(server + '-status');
    if (state == 'on') {
        if (span.textContent !== 'RUNNING') {
            span.textContent ="RUNNING";
            span.classList.add('badge-success');
            span.classList.remove('badge-primary');
            span.classList.remove('badge-danger');
            document.getElementById(`${server}-start`).setAttribute("disabled", true);
            document.getElementById(`${server}-reset`).setAttribute("disabled", true);
            document.getElementById(`${server}-stop`).removeAttribute("disabled");
        }
    } else if (state == 'off') {
        span.textContent = "STOPPED";
        span.classList.add('badge-primary');
        span.classList.remove('badge-success');
        span.classList.remove('badge-danger');
        document.getElementById(`${server}-stop`).setAttribute("disabled", true);
        document.getElementById(`${server}-start`).removeAttribute("disabled");
        document.getElementById(`${server}-reset`).removeAttribute("disabled");
    } else {
        span.textContent = 'UNKNOWN';
        span.classList.remove('badge-success');
        span.classList.remove('badge-primary');
        span.classList.add('badge-danger');
        document.getElementById(`${server}-stop`).setAttribute("disabled", true);
        document.getElementById(`${server}-start`).setAttribute("disabled", true);
        document.getElementById(`${server}-reset`).setAttribute("disabled", true);
    }
}

function getCodes(server){
    let responses = [];
    let urls = Object.keys(server.urls);
    urls.forEach(url => {
        let p = server.urls[url];
        let methods = Object.keys(p);
        methods.forEach(m => {
            let codes = Object.keys(p[m].responses);
            responses = responses.concat(codes);
        });
    });
    return responses;
}