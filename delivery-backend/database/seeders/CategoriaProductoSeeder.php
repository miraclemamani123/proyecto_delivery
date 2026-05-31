<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriaProductoSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categorias_producto')->insert([
            ['negocio_id' => 1, 'nombre' => 'Platos', 'activo' => true, 'created_at' => now()],
            ['negocio_id' => 1, 'nombre' => 'Bebidas', 'activo' => true, 'created_at' => now()],
            ['negocio_id' => 1, 'nombre' => 'Postres', 'activo' => true, 'created_at' => now()],
        ]);
    }
}