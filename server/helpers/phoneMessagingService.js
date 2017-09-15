import * as plivo from 'plivo';
import config from '../../config/env/index'

const ENV = config.env;

const p = plivo.RestAPI({
    authId: 'MANMYXNGZIMZFMNWEXMG',
    authToken: 'OGE5ZjNkMzJlZWUxY2Q3NWNhZTAxMTQ1ZGI4NjM1'
});

function sendSmsToUser(phone, message, cb) {
    var params = {
        'src': '19253171387 ', // Sender's phone number with country code
        'dst': phone, // Receiver's phone Number with country code
        'text': message
    };
    p.send_message(params, function(status, response) {
        var uuid = response['message_uuid'];
        var params1 = { 'record_id': uuid };
        p.get_message(params1, function(status, response1) {
            cb();
        });
    });
}
export default sendSmsToUser;