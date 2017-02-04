from flask import Flask
from flask import request, g, send_from_directory
import requests, json

app = Flask(__name__, static_url_path='')


@app.route('/')
def hello_world():
    return app.send_static_file('index.html')

@app.route('/data', methods=['GET'])
def data():
    with open('data/pseudo.json', "r") as json_data:
        d = json.load(json_data)
    json_data.close();
    return json.dumps(d);

@app.route('/api/google', methods=['POST'])
def img():
    url = request.form.get('url')
    r = requests.get( url ).text
    return r


if __name__ == "__main__":
    import click
    @click.command()
    @click.option('--debug', is_flag=True)
    @click.argument('HOST', default='0.0.0.0')
    @click.argument('PORT', default=8080, type=int)
    def run(debug, host, port):
        HOST, PORT = host, port
        print "running on %s:%d" % (HOST, PORT)
        app.run(host=HOST, port=PORT, debug=debug, threaded=True)

    run()
