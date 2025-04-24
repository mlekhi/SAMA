from time import process_time

from sama_python.swarm import Swarm
import numpy as np

def convert_ndarrays(obj):
    """ Recursively convert NumPy arrays to lists to make them JSON serializable """
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_ndarrays(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_ndarrays(value) for value in obj]
    else:
        return obj
    
def run(Input_Data):
    start = process_time()
    modifiedInput = convert_ndarrays(vars(Input_Data))
    swarm = Swarm(Input_Data)
    answer = swarm.optimize(Input_Data)

    print(process_time()-start, "Total execution time [Sec]")
    return answer
    