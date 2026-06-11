<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('negocios', function (Blueprint $table) {
            $table->string('qr_yape')->nullable()->after('imagen');
            $table->string('qr_plin')->nullable()->after('qr_yape');
            $table->string('qr_tunki')->nullable()->after('qr_plin');
        });
    }

    public function down(): void
    {
        Schema::table('negocios', function (Blueprint $table) {
            $table->dropColumn(['qr_yape', 'qr_plin', 'qr_tunki']);
        });
    }
};