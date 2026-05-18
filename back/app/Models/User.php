<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public $timestamps = false;

    protected $fillable = [
        'username',
        'password',
        'client',
        'client_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'client' => 'boolean',
        'password' => 'hashed',
    ];

    public function clientProfile(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function missions(): HasMany
    {
        return $this->hasMany(Mission::class, 'users_id');
    }
}