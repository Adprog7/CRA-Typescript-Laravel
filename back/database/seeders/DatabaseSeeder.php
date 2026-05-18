<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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

        // Insertion directe en SQL (ignore les Timestamps de Laravel)
        $clientId = DB::table('client')->insertGetId([
            'society' => 'FFS'
        ]);

        $userId = DB::table('users')->insertGetId([
            'username' => 'Mathieu TUDISCO',
            'password' => Hash::make('password'),
            'client' => 0,
            'client_id' => null
        ]);

        DB::table('mission')->insert([
            'client_id' => $clientId,
            'users_id' => $userId,
            'budget' => 10000,
            'rate' => 700,
            'libelle' => 'Développement Application CRA'
        ]);
    }
}