import os
from diagrams import Diagram, Edge
from diagrams.aws.compute import Lambda
from diagrams.aws.database import Dynamodb
from diagrams.aws.network import APIGateway
from diagrams.aws.integration import SQS, SNS

graph_attr = {
    "label": ""
}

FILENAME = os.getenv("FILENAME", "diagram")

with Diagram("diagram", filename=FILENAME, show=False, graph_attr=graph_attr):
    api = APIGateway("API")
    api2 = APIGateway("API")
    api_lambda = Lambda("Task API")
    db = Dynamodb("Task DB")
    pub_lambda = Lambda("Task Publisher")
    topic = SNS("TaskTopic")

    api >> api_lambda
    api << api_lambda
    api_lambda >> db
    api_lambda << db
    db >> Edge(label="Stream") >> pub_lambda
    pub_lambda >> topic

    for x in ["1", "2", "N"]:
        sqs = SQS(f"Task{x}Queue")
        l = Lambda(f"Task{x}Handler")
        topic >> sqs >> l >> Edge(label="Update status") >> api2


