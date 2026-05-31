<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RepartidorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('repartidores')->insert([
            'usuario_id'   => 4,
            'latitud'      => -12.856,
            'longitud'     => -72.692,
            'estado'       => 'disponible',
            'aprobado'     => true,
            'aprobado_por' => 1,
            'created_at'   => now(),
        ]);
    }
}