import subprocess
import os
import sys
import re
import time
import uuid
from datetime import datetime

DOCKER_LOCATIONS = "../aws-doc-sdk-examples/"
OUTPUT_LOCATION = "../test_runs/"

def get_folder_names():
    folder_names = []
    try:
        items = os.listdir(DOCKER_LOCATIONS)
        for item in items:
            item_path = os.path.join(DOCKER_LOCATIONS, item)
            if item in ['rustv1', 'dotnetv3', 'go', 'javascriptv3', 'python', 'gov2', 'java', 'rust_dev_preview', 'cpp', 'swift', 'ruby']:
                continue
            if os.path.isdir(item_path) and item[0] != ".":
                folder_names.append(item_path)
    except FileNotFoundError:
        pass
    except Exception as e:
        pass
    return folder_names

def main():
    # for each language folder
    folders = get_folder_names()
    print(folders)
    for folder in folders:
    # if there is a Dockerfile
        if os.path.exists(folder + "/Dockerfile"):

            # build the docker image and capture the id
            build_process = subprocess.Popen(['docker', 'build',  '.', '-q'], cwd=folder,stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            build_out, build_err = build_process.communicate()
            print(build_out.decode('utf-8'))
            build = build_out.decode('utf-8')[7:].strip()
            print("Successfully built image with id: " + build)
            # run the Dockerfile and capture the output
            print("attempting to run " + build + " in " + folder)
            result_process = subprocess.Popen(['docker', 'run', build], cwd=folder, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#             print("Command run was: {}".format(result_process.args))
            result_out, result_err = result_process.communicate()
            result = result_out.decode('utf-8')
            print(result)
        #if the output validates against the schema
            # write the output to a properly named file in location
        # else
            # log an error for that language
            # assume it validates for now
#             java-2025-05-13T12-15.json
#             language-year-month-dayThours-minutes .json ?
            date_time = datetime.now().strftime("%Y-%m-%dT%H-%M")
            language = folder.replace("aws-doc-sdk-examples", "test-runs")
            with open(language + "-" + date_time + ".json", "w") as file:
                file.write(result)

if __name__ == "__main__":
    main()
