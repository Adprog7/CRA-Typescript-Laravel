<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Créer des utilisateurs de démo
        User::create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => Hash::make('password123'),
        ]);

        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Missions de démo
        DB::table('missions')->insert([
            [
                'name' => 'Développement API REST',
                'description' => 'Créer les endpoints de l\'API',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Frontend React',
                'description' => 'Créer l\'interface utilisateur',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Système d\'authentification',
                'description' => 'Implémenter le login et registration',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Tests unitaires',
                'description' => 'Écrire les tests',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
