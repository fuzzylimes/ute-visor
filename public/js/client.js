var socket = io('http://localhost:5555');
socket.on('data update', function (data) {
    console.log(data);
    data.forEach(function (o) {
        var server = Object.keys(o)[0];
        var state = o[server].state;
        var span = document.getElementById(server + '-status');
        // console.log(span);
        if (state == 'on') {
            if (span.textContent !== 'RUNNING') {
                var txt = document.createTextNode('RUNNING');
                span.appendChild(txt);
                span.classList.add('badge-success')
                let button = document.getElementById(`${server}-start`);
                // button.classList.add('disabled');
                button.setAttribute("disabled", true);
            }
        } else if (state == 'off'){
            var txt = 'STOPPED';
            span.appendChild(txt);
            span.classList.add('badge-primary')
            let button = document.getElementById(`${server}-stop`);
            // button.classList.add('disabled');
            button.setAttribute("disabled", true);
        } else {
            var txt = 'UNKNOWN'
            span.appendChild(txt);
            span.classList.add('badge-danger');
        }

        let urls = Object.keys(o[server].urls);
        let responses = getCodes(o[server]);
        responses = [...new Set(responses)].sort();
        let myHtml = "";
        urls.forEach(url => {
            let p =  o[server].urls[url];
            let methods = Object.keys(p);
            // methods.forEach(m => {
            //     let codes = Object.keys(p[m].responses);
            //     console.log(codes);
            //     responses = responses.concat(codes);
            // });
            // console.log(responses);
            methods.forEach(m => {
                myHtml += `<tr><td>${url}</td><td>${m}</td><td>${p[m].tx}</td><td>${p[m].rx}</td>`
                responses.forEach(r =>{
                    p[m].responses.hasOwnProperty(r) ? 
                    myHtml += `<td>${p[m].responses[r]}</td>` :
                    myHtml += `<td>0</td>`;
                });
                let success = ((p[m].tx / p[m].expected) * 100);
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
});

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