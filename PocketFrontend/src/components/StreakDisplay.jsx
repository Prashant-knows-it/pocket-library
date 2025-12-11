import React, { useEffect, useState } from 'react'

export default function StreakDisplay() {
    const [streak, setStreak] = useState({ currentStreak: 0, highestStreak: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStreak = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return

                const response = await fetch('http://localhost:8080/api/streak', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setStreak(data)
                }
            } catch (error) {
                console.error('Failed to fetch streak:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStreak()
    }, [])

    if (loading || streak.currentStreak === 0) return null

    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            padding: '6px 12px',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(255,159,10,0.1))',
            borderRadius: '12px',
            border: '1px solid rgba(255,107,53,0.2)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ff6b35'
            }}>
                <span style={{ fontSize: '18px' }}>🔥</span>
                <span>{streak.currentStreak}</span>
            </div>

            <div style={{
                width: '1px',
                height: '16px',
                background: 'rgba(255,107,53,0.3)'
            }}></div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffa500'
            }}>
                <span style={{ fontSize: '16px' }}>🏆</span>
                <span>{streak.highestStreak}</span>
            </div>
        </div>
    )
}
