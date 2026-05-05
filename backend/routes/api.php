<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NewsArticleController;

// When someone goes to /api/news, run the 'index' function we just wrote!
Route::get('/news', [NewsArticleController::class, 'index']);
Route::post('/news-upload', [App\Http\Controllers\NewsArticleController::class, 'store']);