<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('qr_share_tokens', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('token')->unique();
            
            // Polimórfico ULID: shareable_type, shareable_id
            $table->ulidMorphs('shareable');
            $table->foreignUlid('created_by')->constrained('users')->cascadeOnDelete();
            
            $table->enum('scope', ['student_launch', 'peer_review', 'public_read'])->default('student_launch');
            $table->unsignedInteger('max_uses')->nullable(); // null = ilimitado
            $table->unsignedInteger('uses_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_share_tokens');
    }
};
