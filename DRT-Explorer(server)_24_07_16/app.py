import socketio
from sanic import Sanic
from sanic.response import json as sanic_json
from sanic.response import text as sanic_text
from sanic_cors import CORS
import logging
import os
import json

logger = logging.getLogger()
logger.setLevel(logging.WARNING)

port = 8664
sio = socketio.AsyncServer(async_mode='sanic', cors_allowed_origins='*')
app = Sanic('DRT-Server')
CORS(app)  # CORS 설정 추가
app.config['CORS_SUPPORTS_CREDENTIALS'] = True
sio.attach(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

@app.listener('before_server_start')
async def before_server_start(app, loop):
    print("Starting server...")

@app.route('/api/record_list')
async def get_record_list(request):
    record_list_path = os.path.join(DATA_DIR, 'record_list.json')
    with open(record_list_path) as f:
        data = json.load(f)
    return sanic_json(data)

@app.route('/api/node_data')
async def get_node_data(request):
    node_data_path = os.path.join(DATA_DIR, 'SiouxFalls_node.csv')
    with open(node_data_path) as f:
        csv_content = f.read()
    return sanic_text(csv_content, content_type='text/plain')

@app.route('/api/drt_data')
async def get_drt_data(request):
    drt_data_path = os.path.join(DATA_DIR, 'logs_20_47_25.json')
    with open(drt_data_path) as f:
        data = json.load(f)
    return sanic_json(data)

@sio.on('connect')
async def connect(sid, environ):
    print(f'Client connected: {sid}')
    await sio.emit('connection_response', 'handshake success', room=sid)

@sio.on('disconnect')
async def disconnect(sid):
    print(f'Client disconnected: {sid}')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=port)
