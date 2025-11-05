import os
from flask import Flask, Blueprint, request, jsonify

app = Flask(__name__)

path_cwd = os.path.dirname(os.path.realpath(__file__))
path_templates = os.path.join(path_cwd,"templates")
path_static = os.path.join(path_cwd,"static")

Func = Blueprint('func', __name__, static_folder=path_static, template_folder=path_templates)
@Func.route('/func', methods=['GET','POST'])
def func():

    dataGet = '' if not request.get_json(force=True) else request.get_json(force=True)
    print(dataGet)
    dataReply = {'backend_data':'some_data'}
    print(dataReply)
    return jsonify(dataReply)