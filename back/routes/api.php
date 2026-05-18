<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

Route::get('/test', function () {
    return response()->json(['message' => 'API OK']);
});

Route::post('/login', function (Request $request) {
    $validated = $request->validate([
        'email' => 'required',
        'password' => 'required',
    ]);

    $user = DB::table('users')
                ->where('email', $validated['email'])
                ->orWhere('username', $validated['email'])
                ->first();

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
            'client' => $user->client,
        ],
    ]);
});

Route::post('/client-login', function (Request $request) {
    $validated = $request->validate([
        'company_name' => 'required|string',
    ]);

    $companyName = trim($validated['company_name']);

    $user = DB::table('users')
                ->where('client', 1)
                ->whereRaw('LOWER(username) = ?', [strtolower($companyName)])
                ->first();

    if (!$user) {
        return response()->json([
            'message' => 'Entreprise non trouvée'
        ], 401);
    }

    return response()->json([
        'token' => 'demo-token-client-' . $user->id,
        'user' => [
            'id' => $user->id,
            'name' => $user->username,
            'email' => $user->email,
            'client' => $user->client,
        ],
    ]);
});


Route::post('/register', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|min:6|confirmed',
        'isClient' => 'nullable|boolean',
    ]);

    try {
        $user = User::create([
            'username' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'client' => $request->boolean('isClient') ? 1 : 0,
        ]);


        return response()->json([
            'message' => 'Inscription réussie',
            'user' => [
                'id' => $user->id,
                'name' => $user->username,
                'email' => $user->email,
                'client' => $user->client,
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

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/users/clients', function () {
    return DB::table('users')
        ->join('client', 'users.client_id', '=', 'client.id')
        ->where('users.client', 1)
        ->select('client.id as id', 'client.society as name')
        ->get();
});

Route::post('/companies', function (Request $request) {
    if (!$request->has('user_id')) {
        return response()->json(['message' => 'user_id requis'], 400);
    }

    $validated = $request->validate([
        'name' => 'required|string|max:255',
    ]);

    $companyName = trim($validated['name']);

    $existingUser = DB::table('users')->whereRaw('LOWER(username) = ?', [strtolower($companyName)])->where('client', 1)->first();
    if ($existingUser) {
        return response()->json(['message' => 'Cette entreprise existe déjà'], 422);
    }

    $clientId = DB::table('client')->insertGetId([
        'society' => $companyName,
    ]);

    $userId = DB::table('users')->insertGetId([
        'username' => $companyName,
        'email' => strtolower(preg_replace('/\s+/', '.', $companyName)) . '_' . time() . '@client.local',
        'password' => Hash::make(\Illuminate\Support\Str::random(12)),
        'client' => 1,
        'client_id' => $clientId,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return response()->json([
        'message' => 'Entreprise créée avec succès',
        'company' => [
            'id' => $clientId,
            'name' => $companyName,
        ]
    ], 201);
});

Route::get('/missions', function (Request $request) {
    if (!$request->has('user_id')) {
        return response()->json(['message' => 'user_id requis'], 400);
    }

    $userId = $request->query('user_id');
    $user = DB::table('users')->where('id', $userId)->first();
    $isClient = $user && $user->client == 1;

    if ($isClient) {
        return DB::table('mission')
            ->join('users', 'mission.users_id', '=', 'users.id')
            ->where('mission.client_id', $user->client_id)
            ->select('mission.id', DB::raw("CONCAT(mission.libelle, ' - ', users.username) as name"), DB::raw("CONCAT(mission.libelle, ' - ', users.username) as description"), 'mission.budget', 'mission.rate', DB::raw('(SELECT COALESCE(SUM(time), 0) FROM past_day WHERE past_day.mission_id = mission.id) as total_days_logged'))
            ->get();
    } else {
        return DB::table('mission')
            ->leftJoin('client', 'mission.client_id', '=', 'client.id')
            ->where('mission.users_id', $userId)
            ->select('mission.id', 'mission.libelle as name', 'mission.libelle as description', 'client.society as company_name', 'mission.budget', 'mission.rate', DB::raw('(SELECT COALESCE(SUM(time), 0) FROM past_day WHERE past_day.mission_id = mission.id) as total_days_logged'))
            ->get();
    }
});

Route::post('/missions', function (Request $request) {
    if (!$request->has('user_id')) {
        return response()->json(['message' => 'user_id requis'], 400);
    }

    $validated = $request->validate([
        'user_id' => 'required',
        'name' => 'required|string|max:255',
        'client_id' => 'nullable|integer',
        'budget' => 'nullable|numeric',
        'rate' => 'nullable|numeric',
    ]);

    $missionId = DB::table('mission')->insertGetId([
        'users_id' => $validated['user_id'],
        'libelle' => $validated['name'],
        'client_id' => $request->input('client_id'),
        'budget' => $request->input('budget'),
        'rate' => $request->input('rate'),
    ]);

    return response()->json([
        'message' => 'Mission créée avec succès',
        'mission' => [
            'id' => $missionId,
            'name' => $validated['name'],
            'description' => $validated['name'],
            'budget' => $request->input('budget'),
            'rate' => $request->input('rate'),
        ]
    ], 201);
});

Route::post('/cra/save', function (Request $request) {
    $validated = $request->validate([
        'startDate' => 'required|date',
        'endDate' => 'required|date',
        'mission_ids' => 'present|array',
        'entries' => 'present|array',
    ]);

    $missionIds = $validated['mission_ids'];
    $startDate = $validated['startDate'];
    $endDate = $validated['endDate'];
    $entries = $validated['entries'];

    if (!empty($missionIds)) {
        DB::table('past_day')
            ->whereIn('mission_id', $missionIds)
            ->whereBetween('date', [$startDate, $endDate])
            ->delete();
    }

    if (!empty($entries)) {
        DB::table('past_day')->insert($entries);
    }

    return response()->json(['message' => 'CRA sauvegardé !']);
});

Route::get('/cra/week', function (Request $request) {
    if (!$request->has('user_id') || !$request->has('startDate') || !$request->has('endDate')) {
        return response()->json([], 400);
    }

    $userId = $request->query('user_id');
    $startDate = $request->query('startDate');
    $endDate = $request->query('endDate');

    $user = DB::table('users')->where('id', $userId)->first();
    $isClient = $user && $user->client == 1;

    $query = DB::table('past_day')
        ->join('mission', 'past_day.mission_id', '=', 'mission.id')
        ->whereBetween('past_day.date', [$startDate, $endDate])
        ->select('past_day.mission_id', 'past_day.date', 'past_day.time');

    if ($isClient) {
        $query->where('mission.client_id', $user->client_id);
    } else {
        $query->where('mission.users_id', $userId);
    }

    $entries = $query->get();

    return $entries;
});

Route::get('/missions/{id}/monthly', function ($id) {
    $mission = DB::table('mission')->where('id', $id)->first();
    if (!$mission) {
        return response()->json(['message' => 'Mission non trouvée'], 404);
    }

    $stats = DB::table('past_day')
        ->selectRaw('DATE_FORMAT(date, "%Y-%m") as month, SUM(time) as total_days')
        ->where('mission_id', $id)
        ->groupBy('month')
        ->orderBy('month', 'desc')
        ->get();

    $stats = $stats->map(function ($item) use ($mission) {
        $item->cost = $item->total_days * ($mission->rate ?? 0);
        return $item;
    });

    return response()->json($stats);
});
