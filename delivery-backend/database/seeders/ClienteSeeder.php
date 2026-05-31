<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClienteSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('clientes')->insert([
            'usuario_id'  => 3,
            'latitud'     => -12.857,
            'longitud'    => -72.693,
            'created_at'  => now(),
        ]);
    }
}