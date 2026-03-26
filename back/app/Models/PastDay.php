<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PastDay extends Model
{
    protected $table = 'past_day';
    public $timestamps = false;
    protected $fillable = ['mission_id', 'date', 'time', 'comment'];

    public function mission()
    {
        return $this->belongsTo(Mission::class);
    }
}
