from flask import Flask
from flask_restx import Resource, Api
from flask_cors import CORS
import pickle
from pathlib import Path
from flask_restx import reqparse
import json
import numpy as np


app = Flask(__name__)
api = Api(app)
# Allow cross origin resource sharing
CORS(app) 

model = None

@app.before_first_request
def startup():
    global model
    model_path = Path(__file__).parent.joinpath('model/mnist_784_svc.model')
    with open(model_path, 'rb') as f:
        model = pickle.load(f)

@api.route('/number-detection/detect')
class HelloWorld(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('image', required=True)
        args = parser.parse_args()
        image = json.loads(args.image)

        X = np.array(image).reshape(1, -1)
        y = model.predict(X)
        y = y[0]

        return {'prediction': y}

if __name__ == '__main__':
    app.run(debug=True)
