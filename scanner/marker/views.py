from django.shortcuts import render, render_to_response
from django.http import HttpResponse, JsonResponse

from django.views.decorators.csrf import csrf_exempt

from .models import MarkedText

from marker.simplemarker import SimpleMarker

import json

# Create your views here.

def test_view(request):
    return HttpResponse(1)

@csrf_exempt
def mark_text(request):
    text = request.POST.get('text')

    if not text:
        return HttpResponse('You didn\'t post no text. :(')

    m = SimpleMarker()
    data = m.mark_text(text)

    newMarked = MarkedText(text=text, data=data)
    newMarked.save()

    return HttpResponse(newMarked.id)

def enter_text(request):
    return render_to_response('marker/new.html', {})

def view_marked(request):
    theid = request.GET.get('id')

    if not theid:
        return HttpResponse('You didn\'t give me no ID.')
    
    marked = MarkedText.objects.get(pk=theid)
    data = json.dumps(marked.data)

    return render_to_response('marker/display.html', {'marked': marked, 'data': data})

@csrf_exempt
def update_marked(request):
    theid = request.POST.get('id')
    thedata = request.POST.get('data')

    marked = MarkedText.objects.get(pk=theid)
    marked.data = json.loads(thedata)
    marked.save()

    return HttpResponse(marked.id)

def all(request):
    marked_texts = MarkedText.objects.all()

    return render_to_response('marker/all.html', {'analyses': marked_texts})

def getAnalysisText(request):
    theid = request.GET.get('id')

    response = HttpResponse(0)

    if not theid:
        response = HttpResponse(-1)
    
    marked = MarkedText.objects.get(pk=theid)

    if marked.analysis:
        response = HttpResponse(marked.analysis)

    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET"
    response["Access-Control-Max-Age"] = "1000"
    response["Access-Control-Allow-Headers"] = "*"

    return response

def getAnalysisVideo(request):
    theid = request.GET.get('id')

    response = HttpResponse(0)
    
    if not theid:
        response = HttpResponse(-1)
    
    marked = MarkedText.objects.get(pk=theid)

    if marked.video_url:
        response = HttpResponse(marked.video_url)

    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET"
    response["Access-Control-Max-Age"] = "1000"
    response["Access-Control-Allow-Headers"] = "*"

    return response

def getAnalysisData(request):
    theid = request.GET.get('id')

    response = HttpResponse(0)
    
    if not theid:
        response = HttpResponse(-1)
    
    marked = MarkedText.objects.get(pk=theid)

    if marked.data:
        response = JsonResponse(marked.data, safe=False)

    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET"
    response["Access-Control-Max-Age"] = "1000"
    response["Access-Control-Allow-Headers"] = "*"

    return response