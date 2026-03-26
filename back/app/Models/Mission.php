<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mission extends Model
{
    protected $table = 'mission';
    public $timestamps = false;
    protected $fillable = ['client_id', 'users_id', 'budget', 'rate', 'libelle'];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'users_id');
    }

    public function pastDays()
    {
        return $this->hasMany(PastDay::class, 'mission_id');
    }
}
