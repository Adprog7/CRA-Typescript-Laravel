<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // On désactive les contraintes pour vider les tables proprement
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('client')->truncate();
        DB::table('users')->truncate();
        DB::table('mission')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Créer des clients
        $clientId1 = DB::table('client')->insertGetId([
            'society' => 'Google',
        ]);

        $clientId2 = DB::table('client')->insertGetId([
            'society' => 'Facebook',
        ]);

        // 2. Créer des utilisateurs de démo (développeurs)
        $devUser = User::create([
            'username' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => Hash::make('password123'),
            'client' => 0,
        ]);

        $testUser = User::create([
            'username' => 'test@test.com',
            'email' => 'test@test.com',
            'password' => Hash::make('password123'),
            'client' => 0,
        ]);

        // 3. Créer des utilisateurs de démo (clients)
        DB::table('users')->insert([
            [
                'username' => 'Google',
                'email' => 'google@client.local',
                'password' => Hash::make('password123'),
                'client' => 1,
                'client_id' => $clientId1,
            ],
            [
                'username' => 'Facebook',
                'email' => 'facebook@client.local',
                'password' => Hash::make('password123'),
                'client' => 1,
                'client_id' => $clientId2,
            ]
        ]);

        // 4. Créer des missions de démo pour le testUser
        $missionId1 = DB::table('mission')->insertGetId([
            'users_id' => $testUser->id,
            'libelle' => 'Développement API REST',
            'client_id' => $clientId1,
            'budget' => 5000.00,
            'rate' => 500.00,
        ]);

        $missionId2 = DB::table('mission')->insertGetId([
            'users_id' => $testUser->id,
            'libelle' => 'Frontend Mobile Expo',
            'client_id' => $clientId2,
            'budget' => 8000.00,
            'rate' => 600.00,
        ]);

        // 5. Créer des temps passés (past_days)
        $today = new \DateTime();
        $monday = clone $today;
        $dayOfWeek = (int)$today->format('N');
        $monday->modify('-' . ($dayOfWeek - 1) . ' days'); // go to Monday of this week

        // Seed some days for this week
        for ($i = 0; $i < 5; $i++) {
            $date = clone $monday;
            $date->modify('+' . $i . ' days');
            
            DB::table('past_day')->insert([
                'mission_id' => $missionId1,
                'date' => $date->format('Y-m-d'),
                'time' => 1.0,
                'comment' => 'Travail sur les endpoints',
            ]);

            DB::table('past_day')->insert([
                'mission_id' => $missionId2,
                'date' => $date->format('Y-m-d'),
                'time' => 0.5,
                'comment' => 'Intégration UI',
            ]);
        }
    }
}