# for serialising responses and testing
import numpy
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
# for querying and updating the mysql database
from django.db import connection
# for AI and structuring the data
import os
import pandas as pd
import pandasai as pai
from pandasai_openai import OpenAI
import io
import matplotlib
matplotlib.use('Agg')


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
llm = OpenAI(api_token=OPENAI_API_KEY)
pai.config.set({"llm":llm})

def response(code: int, message: str, data: any=None):
    body = {'code':code, 'message':message,'data':{}}
    if data is not None:
        if hasattr(data, '__dict__'):
            body['data'] = data.__dict__
        else:
            body['data']=data
    return HttpResponse(json.dumps(body, sort_keys=True))


@require_http_methods(['GET'])
def fileList(request):
    files = []
    with connection.cursor() as cursor:
        # Query the database to get all file names from the 'names' table
        cursor.execute("SELECT id, file_name FROM files")
        result = cursor.fetchall()
        # Convert the query result into a list of files
        for row in result:
            files.append({
                "id": row[0],  # The 'id' column from the database
                "title": row[1],  # The 'name' column from the database
            })
    return response(0, "ok", files)


@require_http_methods(['GET'])
def history(request):
    # Get prompts from the database
    with connection.cursor() as cursor:
        cursor.execute("SELECT prompt FROM prompts")
        rows = cursor.fetchall()
    # Convert the rows to a list of strings
    prompts = [row[0] for row in rows]
    return response(0, "ok", prompts)



@csrf_exempt
@require_http_methods(['POST'])
# File upload API
def fileAdd(request):
    # Check if a file is present in the request
    if 'file' not in request.FILES:
        return response(1, 'No file provided.')
    file = request.FILES['file']
    file_name = file.name
    file_content = file.read()  # Read file content as binary
    try:
        with connection.cursor() as cursor:
            # Check if the file name already exists
            cursor.execute("SELECT COUNT(*) FROM files WHERE file_name = %s", [file_name])
            (count,) = cursor.fetchone()
            if count > 0:
                return response(1, 'A file with this name already exists.')
            # Insert the file only if it does not exist
            cursor.execute(
                "INSERT INTO files (file_name, content) VALUES (%s, %s)",
                [file_name, file_content]
            )
        return response(0, 'File uploaded successfully and stored in the database.')
    except Exception as e:
        return response(1, f"Error saving file to the database: {str(e)}")


# 1. finds file based on file name
# 2. converts it into a pandas dataframe
def read_file_from_db(file_name: str):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT content FROM files WHERE file_name = %s", [file_name])
            blob_data = cursor.fetchone()
            if blob_data is None:
                print(f"No file found with the name: {file_name}")
                return None
            file_content = blob_data[0]
            file_like_object = io.BytesIO(file_content)
            file_extension = file_name[-4:]
            if file_extension == '.csv':
                pd_df = pd.read_csv(file_like_object)
            elif file_extension == '.xls':
                pd_df = pd.read_excel(file_like_object)
            else:
                print(f"Unsupported file extension: {file_extension}")
                return None
            #df = pai.DataFrame(pd_df)
            return pd_df
    except Exception as e:
        print(f"Error occurred: {e}")
        return None

# utility function to convert pd dataframe to pai dataframe
def df_convert(df: pd.DataFrame):
    return pai.DataFrame(df.to_dict(orient='list'))

@csrf_exempt
@require_http_methods(['POST'])
def promptAdd(request):
    try:
        data = json.loads(request.body)
        prompt = data.get('prompt', '').strip()
        file_name = data.get('title', '').strip()
        if not prompt:
            return response(1, 'Prompt cannot be empty.')
        if not file_name:
            return response(1, 'Title cannot be empty.')
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM prompts WHERE prompt = %s", [prompt])
            (count,) = cursor.fetchone()
            if count == 0:
                cursor.execute("INSERT INTO prompts (prompt) VALUES (%s)", [prompt])
        graph_keywords = ['draw', 'graph', 'chart', 'plot', 'drawing', 'picture', 'image', 'illustration', 'illustrate', 'paint', 'painting', 'graphs', 'draws', 'charts', 'drawings', 'plots', 'pictures', 'images', 'illustrations', 'illustrates', 'paintings', 'paints']
        if any(keyword in prompt.lower() for keyword in graph_keywords):
            return response(0, 'Prompt added successfully.', {'type': 'chart', 'data': "Graph/chart generation still underdevelopment, currently not available"})
        df = read_file_from_db(file_name)
        pai_df = df_convert(df)
        reply = pai_df.chat(prompt)
        if isinstance(reply.value, str):
            return response(0, 'Prompt added successfully.', {'type': 'string', 'data': reply.value})
        elif isinstance(reply.value, pd.DataFrame):
            return response(0, 'Prompt added successfully.', {'type': 'dataframe', 'data': reply.value.to_json()})
        elif isinstance(reply.value, numpy.int64):
            return response(0, 'Prompt added successfully.', {'type': 'number', 'data': str(reply.value)})
        else:
            return response(1, 'Error responding.')
    except Exception as e:
        return response(1, f'Error occurred while adding the prompt: {str(e)}')




