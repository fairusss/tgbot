function func() {
    var xml = new XMLHttpRequest();
    xml.open('POST', "{{url_for('func.func')}}", true);
    xml.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xml.onload = function () {
        var dataReply = JSON.parse(this.responseText);
    }; //endfunction

    dataSend = JSON.stringify({
        page_data: 'some_data',
    });

    xml.send(dataSend);
}
