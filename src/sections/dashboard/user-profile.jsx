'use client';

import { useState, useEffect } from 'react';

import { Box, Card, Typography, CircularProgress } from '@mui/material';

import { useSupabaseUser } from 'src/auth/hooks/use-supabase-user';

export function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userResult = useSupabaseUser();
  //console.log("userResult", userResult);

  useEffect(() => {
    async function fetchUserData() {
      try {
        if (userResult.user && userResult.user.then) {
          // If user is a Promise
          const resolvedUser = await userResult.user;
          setUserData(resolvedUser);
        } else if (userResult.then) {
          // If the entire userResult is a Promise
          const resolved = await userResult;
          setUserData(resolved.user);
        } else {
          // If it's already resolved
          setUserData(userResult.user);
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userResult]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>User Profile</Typography>
      {userData ? (
        <Box>
          <Typography>User ID: {userData.id}</Typography>
          {userData.username && (
            <Typography>Username: {userData.username}</Typography>
          )}
          {userData.full_name && (
            <Typography>Name: {userData.full_name}</Typography>
          )}
        </Box>
      ) : (
        <Typography>No user data available</Typography>
      )}
    </Card>
  );
}
