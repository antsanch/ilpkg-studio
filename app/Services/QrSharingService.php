<?php

namespace App\Services;

use App\Models\QrShareToken;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class QrSharingService
{
    /**
     * Genera un token firmado y devuelve el render SVG del Código QR
     */
    public function generateShareQr(
        Model $model,
        string $scope = 'student_launch',
        ?int $maxUses = null,
        ?\DateTimeInterface $expiresAt = null,
        ?string $userId = null
    ): array {
        $token = QrShareToken::create([
            'token'      => Str::uuid()->toString(),
            'shareable_type' => get_class($model),
            'shareable_id'   => $model->getKey(),
            'created_by' => $userId ?? auth()->id() ?? (string) Str::ulid(),
            'scope'      => $scope,
            'max_uses'   => $maxUses,
            'expires_at' => $expiresAt,
        ]);

        $signedUrl = url("/qr/resolve/{$token->token}");

        // Renderizado SVG vectorial nativo sin dependencias de ext-gd
        $renderer = new ImageRenderer(
            new RendererStyle(320, 2),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        $qrSvg = $writer->writeString($signedUrl);

        return [
            'token'      => $token->token,
            'url'        => $signedUrl,
            'svg'        => $qrSvg,
            'expires_at' => $expiresAt?->format('c'),
        ];
    }

    /**
     * Valida y resuelve el token QR
     */
    public function resolveToken(string $tokenString): QrShareToken
    {
        $token = QrShareToken::where('token', $tokenString)->firstOrFail();

        if ($token->expires_at && $token->expires_at->isPast()) {
            abort(410, 'El código QR ha expirado.');
        }

        if ($token->max_uses !== null && $token->uses_count >= $token->max_uses) {
            abort(403, 'Este código QR ha alcanzado su límite máximo de usos.');
        }

        $token->increment('uses_count');

        return $token;
    }
}
