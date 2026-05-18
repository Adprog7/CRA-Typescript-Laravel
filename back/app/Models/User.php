<?php

namespace App\Models;


use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['username', 'email', 'password', 'client', 'client_id'])]
#[Hidden(['password'])]
class User extends Authenticatable
{

    use HasFactory, Notifiable;

    const UPDATED_AT = null;


    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
