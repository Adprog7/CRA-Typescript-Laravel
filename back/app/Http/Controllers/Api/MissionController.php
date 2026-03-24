<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MissionController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(Mission::with('client')->get());
        }

        if ($user->client) {
            $missions = Mission::with('client')
                ->where('client_id', $user->client_id)
                ->get();
        } else {
            $missions = Mission::with('client')
                ->where('users_id', $user->id)
                ->get();
        }

        return response()->json($missions);
    }
}
