<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsArticle extends Model
{
    // Bug fix #3: featured_image was missing from fillable — it was being silently dropped
    protected $fillable = ['title', 'slug', 'content', 'featured_image', 'published_at'];
}