<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NewsArticle;

class NewsArticleController extends Controller
{
    public function index()
    {
        // @phpstan-ignore-next-line
        $news = NewsArticle::orderBy('published_at', 'desc')
            ->paginate(12);
        return response()->json($news);
    }   

    public function show($slug)
    {
        $article = NewsArticle::where('slug', $slug)->firstOrFail();
        return response()->json($article);
    }

    public function store(Request $request)
    {
        // Bug fix #5: Validate inputs before saving
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'slug'           => 'required|string|unique:news_articles,slug',
            'content'        => 'required|string',
            'featured_image' => 'nullable|string',
            // Bug fix #3: Accept a custom date, default to now if not provided
            'published_at'   => 'nullable|date',
        ]);

        $article = NewsArticle::create([
            'title'          => $validated['title'],
            'slug'           => $validated['slug'],
            'content'        => $validated['content'],
            // Bug fix #3: Save featured_image (was missing before)
            'featured_image' => $validated['featured_image'] ?? null,
            // Bug fix #3: Use the user-supplied date; fall back to now()
            'published_at' => $validated['published_at'] 
                ? date('Y-m-d H:i:s', strtotime($validated['published_at'])) 
                : now(),
        ]);

        return response()->json($article, 201);
    }
}