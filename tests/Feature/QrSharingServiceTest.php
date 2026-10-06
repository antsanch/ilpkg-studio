<?php

namespace Tests\Feature;

use App\Models\InteractiveLesson;
use App\Models\User;
use App\Services\QrSharingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class QrSharingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_generates_signed_qr_svg_and_token(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $lesson = InteractiveLesson::create([
            'title' => 'Anatomía Dental',
            'slug' => 'anatomia-dental',
        ]);

        $service = new QrSharingService();
        $qrResult = $service->generateShareQr($lesson, 'student_launch');

        $this->assertArrayHasKey('token', $qrResult);
        $this->assertArrayHasKey('svg', $qrResult);
        $this->assertTrue(Str::isUuid($qrResult['token']));
        $this->assertStringContainsString('<svg', $qrResult['svg']);
        $this->assertStringContainsString('</svg>', $qrResult['svg']);
    }

    public function test_resolves_valid_token(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $lesson = InteractiveLesson::create([
            'title' => 'Nervio Trigémino',
            'slug' => 'nervio-trigemino',
        ]);

        $service = new QrSharingService();
        $qrResult = $service->generateShareQr($lesson, 'student_launch', 5);

        $resolved = $service->resolveToken($qrResult['token']);
        $this->assertEquals($lesson->id, $resolved->shareable_id);
        $this->assertEquals(1, $resolved->uses_count);
    }
}
