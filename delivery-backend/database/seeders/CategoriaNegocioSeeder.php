<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriaNegocioSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categorias_negocio')->insert([
            ['nombre' => 'Restaurante', 'activo' => true, 'created_at' => now()],
            ['nombre' => 'Farmacia',    'activo' => true, 'created_at' => now()],
            ['nombre' => 'Tienda',      'activo' => true, 'created_at' => now()],
        ]);
    }
}