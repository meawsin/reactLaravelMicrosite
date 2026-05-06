<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NewsArticle;
use Illuminate\Support\Str;

class ImportController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file',
        ]);

        $file      = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $articles  = [];

        // ── Parse the file based on type ──────────────────────────
        if ($extension === 'json') {
            $articles = $this->parseJson($file);
        } elseif (in_array($extension, ['csv', 'txt'])) {
            $articles = $this->parseCsv($file);
        } elseif (in_array($extension, ['xlsx', 'xls'])) {
            $articles = $this->parseExcel($file);
        }

        // ── Import with duplicate skipping ────────────────────────
        $imported = 0;
        $skipped  = 0;

        foreach ($articles as $article) {
            // Skip if slug already exists
            if (NewsArticle::where('slug', $article['slug'])->exists()) {
                $skipped++;
                continue;
            }

            NewsArticle::create([
                'title'          => $article['title'],
                'slug'           => $article['slug'],
                'content'        => $article['content'],
                'featured_image' => $article['featured_image'] ?? null,
                'published_at'   => isset($article['published_at'])
                    ? date('Y-m-d H:i:s', strtotime($article['published_at']))
                    : now(),
            ]);

            $imported++;
        }

        return response()->json([
            'message'  => "Import complete.",
            'imported' => $imported,
            'skipped'  => $skipped,
        ]);
    }

    // ── JSON parser (WordPress REST API export format) ─────────────
  private function parseJson($file)
{
    $raw  = file_get_contents($file->getRealPath());
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        return [];
    }

    $posts    = isset($data[0]) ? $data : [$data];
    $articles = [];

    foreach ($posts as $post) {
        $title   = $post['title']['rendered']   ?? $post['title']   ?? '';
        $content = $post['content']['rendered'] ?? $post['content'] ?? '';
        $date    = $post['date']                ?? $post['published_at'] ?? null;

        // Clean up slug — remove non-ASCII (Bengali etc)
        $rawSlug = $post['slug'] ?? '';
        $slug    = preg_replace('/[^a-z0-9\-]/', '', strtolower($rawSlug));
        if (empty($slug)) $slug = Str::slug(strip_tags($title));

        // Try every possible place WordPress puts the featured image
        $image = null;

        // Method 1: _embedded wp:featuredmedia (most reliable)
        if (isset($post['_embedded']['wp:featuredmedia'])) {
            foreach ($post['_embedded']['wp:featuredmedia'] as $media) {
                if (isset($media['source_url']) && !empty($media['source_url'])) {
                    $image = $media['source_url'];
                    break;
                }
                // Try media_details sizes
                if (isset($media['media_details']['sizes']['full']['source_url'])) {
                    $image = $media['media_details']['sizes']['full']['source_url'];
                    break;
                }
                if (isset($media['media_details']['sizes']['large']['source_url'])) {
                    $image = $media['media_details']['sizes']['large']['source_url'];
                    break;
                }
            }
        }

        // Method 2: jetpack_featured_media_url
        if (!$image && !empty($post['jetpack_featured_media_url'])) {
            $image = $post['jetpack_featured_media_url'];
        }

        // Method 3: yoast_head_json og:image
        if (!$image && isset($post['yoast_head_json']['og_image'][0]['url'])) {
            $image = $post['yoast_head_json']['og_image'][0]['url'];
        }

        // Method 4: featured_image_url direct field
        if (!$image && !empty($post['featured_image_url'])) {
            $image = $post['featured_image_url'];
        }

        // Method 5: extract first image from content
        if (!$image && !empty($content)) {
            preg_match('/<img[^>]+src=["\']([^"\']+)["\']/', $content, $matches);
            if (!empty($matches[1])) {
                $image = $matches[1];
            }
        }

        if (empty($title)) continue;

        $articles[] = [
            'title'          => strip_tags($title),
            'slug'           => $slug,
            'content'        => $content,
            'featured_image' => $image,
            'published_at'   => $date,
        ];
    }

    return $articles;
}

    // ── CSV parser (Excel sheet format) ───────────────────────────
    private function parseCsv($file)
    {
        $articles = [];
        $handle   = fopen($file->getRealPath(), 'r');
        $headers  = fgetcsv($handle); // first row = column names

        // Normalize headers (lowercase, trim)
        $headers = array_map(fn($h) => strtolower(trim($h)), $headers);

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) !== count($headers)) continue;
            $data = array_combine($headers, $row);

            $title = $data['title'] ?? '';
            if (empty($title)) continue;

            $slug = $data['slug'] ?? Str::slug($title);

            $articles[] = [
                'title'          => $title,
                'slug'           => $slug,
                'content'        => $data['content'] ?? '',
                'featured_image' => $data['featured_image_url'] ?? $data['featured_image'] ?? null,
                'published_at'   => $data['date'] ?? $data['published_at'] ?? now(),
            ];
        }

        fclose($handle);
        return $articles;
    }

    // ── Excel parser (.xlsx) ──────────────────────────────────────
    private function parseExcel($file)
    {
        // Requires: composer require phpoffice/phpspreadsheet
        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
        $sheet       = $spreadsheet->getActiveSheet();
        $rows        = $sheet->toArray();
        $headers     = array_map(fn($h) => strtolower(trim($h ?? '')), array_shift($rows));
        $articles    = [];

        foreach ($rows as $row) {
            if (count($row) !== count($headers)) continue;
            $data  = array_combine($headers, $row);
            $title = $data['title'] ?? '';
            if (empty($title)) continue;

            $slug = $data['slug'] ?? Str::slug($title);

            $articles[] = [
                'title'          => $title,
                'slug'           => $slug,
                'content'        => $data['content'] ?? '',
                'featured_image' => $data['featured_image_url'] ?? $data['featured_image'] ?? null,
                'published_at'   => $data['date'] ?? $data['published_at'] ?? now(),
            ];
        }

        return $articles;
    }
}