<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $table = 'client'; 
    public $timestamps = false;
    protected $fillable = ['society'];

    public function users()
    {
        return $this->hasMany(User::class, 'client_id');
    }

    public function missions()
    {
        return $this->hasMany(Mission::class, 'client_id');
    }
}