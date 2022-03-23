import os
from diagrams import Diagram
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.network import ELB

graph_attr = {
    "label": ""
}

FILENAME = os.getenv("FILENAME", "diagram")

with Diagram("Web Service", filename=FILENAME, show=False, graph_attr=graph_attr):
    ELB("lb") >> EC2("web") >> RDS("userdb")
