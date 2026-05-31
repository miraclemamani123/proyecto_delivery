<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NegocioSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('negocios')->insert([
            'usuario_id'          => 2,
            'categoria_negocio_id' => 1,
            'nombre'              => 'Restaurante El Fogón',
            'descripcion'         => 'El mejor restaurante de Quillabamba',
            'direccion'           => 'Jr. Quillabamba 123',
            'latitud'             => -12.855,
            'longitud'            => -72.691,
            'imagen'              => null,
            'estado'              => 'abierto',
            'aprobado'            => true,
            'aprobado_por'        => 1,
            'created_at'          => now(),
        ]);
    }
}