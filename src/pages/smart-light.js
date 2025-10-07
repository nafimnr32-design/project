import { supabase } from '../lib/supabase.js';
import { formatDate } from '../lib/utils.js';

export async function renderSmartLightDashboard(project) {
  const app = document.getElementById('app');

  const { data: devices } = await supabase
    .from('devices')
    .select('*')
    .eq('project_id', project.project_id);

  const { data: samples } = await supabase
    .from('sl_samples')
    .select('*')
    .eq('project_id', project.project_id)
    .order('ts_utc', { ascending: false })
    .limit(100);

  const latestSample = samples && samples.length > 0 ? samples[0] : null;

  app.innerHTML = `
    <div class="navbar">
      <div class="navbar-container">
        <a href="/" class="navbar-brand">IoT Dashboard</a>
        <ul class="navbar-nav">
          <li><a href="/" class="nav-link">Home</a></li>
          <li><a href="/firmware" class="nav-link">Firmware</a></li>
          <li><a href="/devices" class="nav-link">Devices</a></li>
          <li><a href="/projects" class="nav-link active">Projects</a></li>
        </ul>
      </div>
    </div>

    <div class="container">
      <div class="page-header">
        <h1 class="page-title">${project.project_name}</h1>
        <p class="page-description">
          <span class="badge badge-info">Smart Light</span>
          Project ID: ${project.project_id}
        </p>
      </div>

      ${latestSample ? `
        <div class="grid grid-3">
          <div class="stat-card">
            <div class="stat-value">${latestSample.brightness || 0}%</div>
            <div class="stat-label">Brightness</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${latestSample.power_w?.toFixed(1) || 0}W</div>
            <div class="stat-label">Power Consumption</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${latestSample.color_temp || 0}K</div>
            <div class="stat-label">Color Temperature</div>
          </div>
        </div>
      ` : ''}

      <div class="card">
        <h2 class="card-title">Connected Devices</h2>
        ${devices && devices.length > 0 ? `
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Role</th>
                  <th>Auto Update</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${devices.map(device => `
                  <tr>
                    <td style="font-family: monospace;">${device.device_id}</td>
                    <td><span class="badge ${device.role === 'beta' ? 'badge-warning' : 'badge-secondary'}">${device.role}</span></td>
                    <td>${device.auto_update ? '✓' : '✗'}</td>
                    <td>${formatDate(device.updated_at)}</td>
                    <td>
                      <button class="btn btn-small btn-primary" onclick="window.router.navigate('/device/edit?id=${device.device_id}')">Edit</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">📱</div>
            <p>No devices connected to this project</p>
          </div>
        `}
      </div>

      <div class="card">
        <h2 class="card-title">Telemetry Data</h2>
        ${samples && samples.length > 0 ? `
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Device</th>
                  <th>Brightness (%)</th>
                  <th>Power (W)</th>
                  <th>Color Temp (K)</th>
                </tr>
              </thead>
              <tbody>
                ${samples.map(sample => `
                  <tr>
                    <td>${formatDate(sample.ts_utc)}</td>
                    <td style="font-family: monospace; font-size: 0.8rem;">${sample.device_id.substring(0, 12)}...</td>
                    <td>${sample.brightness || 0}%</td>
                    <td>${sample.power_w?.toFixed(2) || 0}W</td>
                    <td>${sample.color_temp || 0}K</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <p>No telemetry data available yet</p>
          </div>
        `}
      </div>

      <div class="actions">
        <button class="btn btn-secondary" onclick="window.router.navigate('/projects')">Back to Projects</button>
      </div>
    </div>
  `;

  window.updateActiveNav('projects');
}
