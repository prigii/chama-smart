import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ChamaSmart - Investment Group Management Platform'
export const size = {
  width: 1200,
  height: 600,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #2563eb 0%, #16a34a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <div
            style={{
              fontSize: 180,
              fontWeight: 'bold',
              background: 'white',
              color: '#2563eb',
              padding: '20px 40px',
              borderRadius: 20,
            }}
          >
            ChamaSmart
          </div>
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 'normal',
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          Investment Group Management Platform
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
