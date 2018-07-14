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
            }
        } else if (state == 'off'){
            var txt = 'STOPPED';
            span.appendChild(txt);
            span.classList.add('badge-primary')
        } else {
            var txt = 'UNKNOWN'
            span.appendChild(txt);
            span.classList.add('badge-danger');
        }

        let urls = Object.keys(o[server].urls);
        let responses;
        let myHtml = "";
        urls.forEach(url => {
            let p =  o[server].urls[url];
            let methods = Object.keys(p);
            methods.forEach(m => {
                responses = p[m].responses;
                responses = Object.keys(responses);
                myHtml += `<tr><td>${url}</td><td>${m}</td><td>${p[m].tx}</td><td>${p[m].rx}</td>`
                responses.forEach(r =>{
                    myHtml += `<td>${p[m].responses[r]}</td>`
                })
                myHtml += `<td>${p[m].times.min.toFixed(4)}</td><td>${p[m].times.max.toFixed(4)}</td><td>${(p[m].times.sum/p[m].tx).toFixed(4)}</td>
                <td>${((p[m].tx/p[m].expected)*100).toFixed(4)}</td></tr>`
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