<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NewsArticleController;
use App\Http\Controllers\AuthController;

// --- Public Routes ---
Route::get('/news', [NewsArticleController::class, 'index']);
Route::get('/news/{slug}', [NewsArticleController::class, 'show']);

// --- Auth Routes ---
Route::post('/admin/login', [AuthController::class, 'login']);

// --- Protected Admin Routes (require Sanctum token) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/admin/news', [NewsArticleController::class, 'store']);
    Route::post('/admin/logout', [AuthController::class, 'logout']);
    Route::get('/admin/me', function (Request $request) {
        return $request->user();
    });
});