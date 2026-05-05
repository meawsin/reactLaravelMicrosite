<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NewsArticle; //

class NewsArticleController extends Controller
{
    public function index()
    {
        // Fetches news sorted by newest first
        $news = NewsArticle::orderBy('published_at', 'desc')->get();
        return response()->json($news);
    }

        public function store(Request $request)
    {
        return NewsArticle::create([
            'title'        => $request->input('title'),
            'slug'         => $request->input('slug'),
            // Fix for PHP1416: Use input() to bypass protected property access
            'content'      => $request->input('content'), 
            'published_at' => now(),
        ]);
    }
}