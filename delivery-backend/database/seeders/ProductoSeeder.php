<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('productos')->insert([
            [
                'negocio_id'           => 1,
                'categoria_producto_id' => 1,
                'nombre'               => 'Lomo saltado',
                'descripcion'          => 'Con papas fritas y arroz',
                'precio'               => 15.00,
                'imagen'               => null,
                'disponible'           => true,
                'created_at'           => now(),
            ],
            [
                'negocio_id'           => 1,
                'categoria_producto_id' => 1,
                'nombre'               => 'Pollo a la brasa',
                'descripcion'          => 'Porción personal con ensalada',
                'precio'               => 18.00,
                'imagen'               => null,
                'disponible'           => true,
                'created_at'           => now(),
            ],
            [
                'negocio_id'           => 1,
                'categoria_producto_id' => 2,
                'nombre'               => 'Inca Kola',
                'descripcion'          => 'Botella 500ml',
                'precio'               => 3.00,
                'imagen'               => null,
                'disponible'           => true,
                'created_at'           => now(),
            ],
            [
                'negocio_id'           => 1,
                'categoria_producto_id' => 3,
                'nombre'               => 'Arroz con leche',
                'descripcion'          => 'Postre tradicional',
                'precio'               => 5.00,
                'imagen'               => null,
                'disponible'           => true,
                'created_at'           => now(),
            ],
        ]);
    }
}