<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NewsArticle;

class NewsArticleController extends Controller
{
    public function index(Request $request)
    {
        // $request->query('search') reads ?search=pathao from the URL
        // This is called a "query parameter"
        $search = $request->query('search');

        $query = NewsArticle::orderBy('published_at', 'desc');

        // Only apply search filter if search term was provided
        if ($search) {
            // "where" with LIKE = SQL pattern matching
            // % means "anything before or after"
            // so '%pathao%' matches "Pathao raises", "About Pathao", etc.
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                ->orWhere('content', 'LIKE', "%{$search}%");
            });
        }

        $news = $query->paginate(12);

        // Include search term in response so React knows what was searched
        return response()->json([
            'data'         => $news->items(),
            'current_page' => $news->currentPage(),
            'last_page'    => $news->lastPage(),
            'total'        => $news->total(),
            'search'       => $search,
        ]);
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

    public function adminIndex()
    {
        $news = NewsArticle::orderBy('published_at', 'desc')->paginate(20);
        return response()->json($news);
    }

    public function update(Request $request, $id)
    {
        // Find the article by ID, or throw 404 if not found
        // firstOrFail() = "get the first result, or fail with a 404 error"
        $article = NewsArticle::findOrFail($id);

        // Validate — 'sometimes' means "only validate if this field is present"
        // This allows partial updates (only send what changed)
        $validated = $request->validate([
            'title'          => 'sometimes|required|string|max:255',
            'content'        => 'sometimes|required|string',
            'featured_image' => 'nullable|string',
            'published_at'   => 'nullable|date',
            // 'unique' but ignore THIS article's own slug
            'slug'           => 'sometimes|required|unique:news_articles,slug,' . $id,
        ]);

        // If published_at was sent, convert it to MySQL format
        if (isset($validated['published_at'])) {
            $validated['published_at'] = date('Y-m-d H:i:s', strtotime($validated['published_at']));
        }

        // update() = SQL "UPDATE news_articles SET ... WHERE id = X"
        $article->update($validated);

        return response()->json($article);
    }

    public function destroy($id)
    {
        $article = NewsArticle::findOrFail($id);

        // delete() = SQL "DELETE FROM news_articles WHERE id = X"
        $article->delete();

        // 204 = "No Content" — success but nothing to return
        return response()->json(null, 204);
    }
}