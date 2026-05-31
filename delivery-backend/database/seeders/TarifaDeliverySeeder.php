<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TarifaDeliverySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tarifas_delivery')->insert([
            'precio_por_km' => 1.50,
            'activo' => true,
            'created_at' => now(),
        ]);
    }
}