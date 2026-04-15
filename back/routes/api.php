<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API OK']);
});

// Routes d'authentification publiques
Route::post('/login', function (Request $request) {
    $validated = $request->validate([
        'email' => 'required',  // On accepte "email" du frontend mais on cherche dans username
        'password' => 'required',
    ]);

    // Chercher l'utilisateur par username (email en frontend)
    $user = DB::table('users')->where('username', $validated['email'])->first();

    if (!$user) {
        return response()->json([
            'message' => 'Utilisateur non trouvé'
        ], 401);
    }

    if (!Hash::check($validated['password'], $user->password)) {
        return response()->json([
            'message' => 'Mot de passe incorrect'
        ], 401);
    }

    return response()->json([
        'token' => 'demo-token-' . $user->id,
        'user' => [
            'id' => $user->id,
            'name' => $user->username,
            'email' => $user->username,
        ],
    ]);
});

Route::post('/register', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6|confirmed',
    ]);

    try {
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Inscription réussie',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ], 201);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Erreur lors de l\'inscription: ' . $e->getMessage()
        ], 422);
    }
});

Route::post('/logout', function (Request $request) {
    return response()->json([
        'message' => 'Déconnexion réussie'
    ]);
});

// Routes protégées
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Routes des missions
Route::get('/missions', function () {
    return DB::table('mission')->select('id', 'libelle as name', 'libelle as description')->get();
});

