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
        // console.log(Object.keys(o));
        
        // let tr = document.createElement('tr');
        // let th = document.createElement('th');
        // let urls = Object.keys(o[server]).splice(0, 1);
        // let codes = []
        // urls.forEach(url => {
        //     let methods = Object.keys(o[url]);
        //     methods.forEach(method => {
        //         codes += 
        //     });
        // });
        // let s = o[server][urls]
        // let methods = Object.keys(s);
        // methods.forEach(e => {
        //     let td = document.createElement('td');
        //     td.appendChild(document.createTextNode(e));
        //     th.appendChild(td);
        // });

        let card = document.getElementById(server + '-stat-list');
        let div = document.createElement('div');
        div.classList.add("list-group");
        div.setAttribute("id", server+"-stat-list");

        

        let urls = Object.keys(o[server]).slice(1);
        urls.forEach(url => {
            let li = document.createElement('li');
            li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "strong");
            li.setAttribute("id", server + "-test");
            li.appendChild(document.createTextNode(url));
            div.appendChild(li);
            
            let methods = Object.keys(o[server][url]);
            methods.forEach(method => {
                document.createElement('li');
                li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "strong", "pl-1");
                li.appendChild(document.createTextNode(method));
                div.appendChild(li);

                // let codes = Object.keys(o[server][url][method]);
                // let text = "";
                // codes.forEach(code => {
                //     text += `<strong>${code}:</strong> ${o[server][url][method][code]}  `;
                // });
                // document.createElement('li');
                // li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "strong", "pl-2");
                // li.innerHTML = text;
                // div.appendChild(li);
            })
        });
        
        // span = document.createElement('span');
        // span.classList.add("badge", "badge-primary");
        // li.appendChild(span);
        // div.appendChild(li);
        card.parentNode.replaceChild(div, card);



        // let card = document.getElementById(server + '-data');
        // card.innerHTML = JSON.stringify(o[server], undefined, 2);



    });
});