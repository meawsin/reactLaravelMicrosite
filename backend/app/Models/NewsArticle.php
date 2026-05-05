<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsArticle extends Model
{
    // Ensure this property is 'protected' as per Laravel standards
    protected $fillable = ['title', 'slug', 'content', 'published_at'];
}