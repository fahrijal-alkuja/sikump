<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php echo $this->load->view('header') ?>
<?php echo $this->load->view('navbar') ?>
<!-- Begin Page Content -->
<div class="container-fluid">
	<div class="d-sm-flex align-items-center justify-content-between mb-4">
		<h1 class="h3 mb-4 text-gray-800"><?= $titel ?></h1>
	</div>
	<!-- Page Heading -->
	<div class="row">
		<div class="col-xl-3 col-md-6 mb-4">
			<div class="card border-left-primary shadow h-100 py-2">
				<div class="card-body">
					<div class="row no-gutters align-items-center">
						<div class="col mr-2">
							<div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Jumlah Karyawan Unikarta</div>
							<div class="h5 mb-0 font-weight-bold text-gray-800"><?= $jml_karyawan ?></div>
						</div>
						<div class="col-auto">
							<i class="fas fa-calendar fa-2x text-gray-300"></i>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-xl-4 col-lg-5">
			<div class="card shadow mb-4">
				<!-- Card Header - Dropdown -->
				<div class="card-header py-3">
					<h6 class="m-0 font-weight-bold text-primary">Karyawan Berdasarkan Jenis Kelamin</h6>
				</div>
				<!-- Card Body -->
				<div class="card-body">
					<div id="myPieChart" class="chart-pie pt-6">
					</div>
				</div>
			</div>
		</div>
		<div class="col-xl-4 col-lg-5">
			<div class="card shadow mb-4">
				<!-- Card Header - Dropdown -->
				<div class="card-header py-3">
					<h6 class="m-0 font-weight-bold text-primary">Karyawan Berdasarkan Pendidikan</h6>
				</div>
				<!-- Card Body -->
				<div class="card-body">
					<div id="myPieChart1" class="chart-pie pt-6">
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-xl-8 col-lg-8">
			<div class="card shadow mb-6">
				<!-- Card Header - Dropdown -->
				<div class="card-header py-3">
					<h6 class="m-0 font-weight-bold text-primary">Penempatan Karyawan</h6>
				</div>
				<!-- Card Body -->
				<div class="card-body">
					<div id="container2" class="chart-pie pt-6">
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<!-- /.container-fluid -->
<?php echo $this->load->view('footer') ?>
<script type="text/javascript">
	Highcharts.chart('myPieChart', {
		title: {
			text: 'Data Karyawan Berdasar Jenis Kelamin'
		},
		subtitle: {
			text: 'Universitas Kutai Kartanegara'
		},
		xAxis: {
			categories: []
		},

		series: [{
			type: 'pie',
			allowPointSelect: true,
			keys: ['name', 'y', 'selected', 'sliced'],
			data: [
				['Laki_laki', <?php echo $laki ?>, false],
				['Perempuan', <?php echo $perempuan ?>, false]

			],
			showInLegend: true
		}]
	});
</script>
<script type="text/javascript">
	Highcharts.chart('myPieChart1', {
		title: {
			text: 'Data Karyawan Berdasar Pendidikan'
		},
		subtitle: {
			text: 'Universitas Kutai Kartanegara'
		},
		xAxis: {
			categories: []
		},

		series: [{
			type: 'pie',
			allowPointSelect: true,
			keys: ['name', 'y', 'selected', 'sliced'],
			data: [
				['S1', <?php echo $s1 ?>, false],
				['S2', <?php echo $s2 ?>, false],
				['SMA', <?php echo $sma ?>, false]
			],
			showInLegend: true
		}]
	});
</script>
<script type="text/javascript">
	$(function() {
		$('#container2').highcharts({
			chart: {
				type: 'column'
			},
			title: {
				text: 'jumlah Karyawan'
			},
			xAxis: {
				categories: [
					'BAAK',
					'BAK',
					'BAUK',
					'LAP.KOM',
					'LAP.BAHASA',
					'LPPM',
					'LPM',
					'FATEK',
					'FAPERTA',
					'FEBIS',
					'MAP',
					'FISIPOL',
					'FAHUM',
					'FKIP',
					'FAI',
					'PERPUSTAKAAN',
					'PPKK'
				],
				crosshair: true
			},
			yAxis: {
				min: 0,
				title: {
					text: 'Karyawan'
				}
			},
			tooltip: {
				headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
				pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
					'<td style="padding:0"><b>{point.y} org</b></td></tr>',
				footerFormat: '</table>',
				shared: true,
				useHTML: true
			},
			plotOptions: {
				column: {
					pointPadding: 0.2,
					borderWidth: 0
				}
			},
			series: [{
				name: 'jumlah',
				data: [<?php foreach ($karyawan as $k) {
							if ($k->jumlah) {
								echo $k->jumlah . ",";
							} else {
								echo "0,";
							}
						} ?>]
			}]
		});
	});
</script>