var socket = io('http://localhost:5555');
socket.on('data update', function (data) {
    // console.log(data);
    let summary = {};
    let total = {tx: 0, rx: 0, success: 0, codes: {}};
    data.forEach(function (o) {
        var server = Object.keys(o)[0];
        setStatus(server, o);
        // Handle unkown state
        if (o[server].state == 'unk'){
            return true;
        }
            
        let urls = Object.keys(o[server].urls);
        let responses = getCodes(o[server]);
        responses = [...new Set(responses)].sort();
        let myHtml = "";
        urls.forEach(url => {
            let p =  o[server].urls[url];
            let methods = Object.keys(p);
            methods.forEach(m => {
                let success = ((p[m].rx / p[m].expected) * 100);
                total.tx += p[m].tx;
                total.rx += p[m].rx;
                total.success += p[m].expected;
                let c;
                success < 100 ? c = 'class="table-warning"' : c = 'class="table-success"';
                myHtml += `<tr ${c}><td>${url}</td><td>${m}</td><td>${p[m].tx}</td><td>${p[m].rx}</td>`
                responses.forEach(r =>{
                    p[m].responses.hasOwnProperty(r) ? 
                    myHtml += `<td>${p[m].responses[r]}</td>` :
                    myHtml += `<td>0</td>`;
                });
                success < 100 ? success = succes.toFixed(4) : true; 
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
    document.getElementById('tx-total').textContent = total.tx;
    document.getElementById('rx-total').textContent = total.rx;
    let success = (total.rx / total.success)*100;
    success < 100 ? success = success.toFixed(4) : true;
    document.getElementById('success-total').textContent = `${success}%`;
});

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